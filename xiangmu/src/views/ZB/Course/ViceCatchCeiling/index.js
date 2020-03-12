//（总部） 副总退费审批最高限额
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
 
import {
    message, Form, Row, Col, Input, Select, Button, 
} from 'antd';
import { env } from '@/api/env';

const FormItem = Form.Item; 
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { MaximumLimitForApproval } from '@/actions/course';
 
import ContentBox from '@/components/ContentBox';  
import View from './view';

 

class LeaveRefundAudit extends React.Component {

    constructor() {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);

        this.state = {
            maxPrice:'',
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete 
            loading: false, 
        };
    }
    componentWillMount() {
        //载入需要的字典项: 审核状态
        this.loadBizDictionary(['student_change_status_front','confirm_status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

 
    //获取条件列表
    fetch(params) {
        this.setState({ loading: true }); 
        this.props.MaximumLimitForApproval().payload.promise.then((response) => {
            let data = response.payload.data; 
            if (data.state === 'success') {
                this.setState({ 
                    maxPrice: data.data, 
                    loading: false
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
    }; 
    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });

    };
    //视图回调
    onViewCallback = (dataModel) => {
        this.onSearch();
        this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
 

    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case 'modify':
                block_content = <View viewCallback={this.onViewCallback} {...this.state}/>
                break; 
            case "Manage":
            default: 
                let extendButtons = [];
                extendButtons.push(<Button onClick = {()=>this.setState({editMode:'modify'})}>修改</Button>)
                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox bottomButton={this.renderSearchBottomButtons(extendButtons,'r','l')}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form" >
                                    <Row gutter={24}>
                                        <Col span={8}></Col>
                                        <Col span={8}>
                                          <FormItem {...searchFormItemLayout} label={'最高限额'} > 
                                            <span style={{marginRight:'2px'}}>{this.state.maxPrice}</span>元
                                          </FormItem>
                                        </Col> 
                                        <Col span={8}></Col>
                                    </Row>
                                </Form>
                            }
                        </ContentBox> 
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(LeaveRefundAudit);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        MaximumLimitForApproval: bindActionCreators(MaximumLimitForApproval, dispatch),  
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
