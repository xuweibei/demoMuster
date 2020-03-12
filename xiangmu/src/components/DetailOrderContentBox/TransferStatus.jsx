//标准组件环境  咨询情况 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form,Table } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { timestampToTime} from '@/utils';

//业务接口方法引入
import { TransferStatusSearch } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';



class Counselling extends React.Component {

    columns = [
        {
            title: '转班日期',
            fixed:'left',
            width:120,
            dataIndex: 'operateDate',
            render: (text, record, index) => { 
                return timestampToTime(record.operateDate)
            }
            
        }, {
            title: '转出学生',
            width:120,
            dataIndex: 'oldStudentName'
        },
        {
            title: '转出订单号',
            width:200,
            dataIndex: 'oldOrderSn',
        },
        {
            title: '转出班型',
            width:200,
            dataIndex: 'oldClassTypeList', 
            render:(text,record)=>{  
                return  (record.oldClassTypeList && record.oldClassTypeList.length)?record.oldClassTypeList.map(item=>{
                    return <p style={{margin:'2px 0'}}>{item}</p>
                }) : ""
            }
        },
        {
            title: '商品', 
            dataIndex: 'oldrderProductList',
            render:(text,record)=>{
                return (record.oldrderProductList && record.oldrderProductList.length?record.oldrderProductList.join(','):'')
            }
        },
        {
            title: '转出订单金额',
            width:120,
            dataIndex: 'oldTotalAmount'
        },
        {
            title: '转入学生',
            width:120,
            dataIndex: 'newStudentName',
        },
        {
            title: '转入订单号',
            width:200,
            dataIndex: 'newOrderSn',
        },
        {
            title: '转入班型',
            width:200,
            dataIndex: 'newClassTypeList',
            render:(text,record)=>{  
                return  (record.newClassTypeList && record.newClassTypeList.length)?record.newClassTypeList.map(item=>{
                    return <p style={{margin:'2px 0'}}>{item}</p>
                }) : ""
            }
        },
        {
            title: '商品',
            dataIndex: 'newOrderProductList',
            render:(text,record)=>{
                return (record.newOrderProductList && record.newOrderProductList.length?record.newOrderProductList.join(','):'')
            }
        },
        {
            title: '订单金额',
            width:120,
            dataIndex: 'newTotalAmount',
        },
        {
            title: '转出费用',
            fixed:'right',
            width:120,
            dataIndex: 'changeAmount',
        },
    ]
    constructor(props) {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            currentDataModel: null,
            loading: false,
            data: []
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //检索数据
    fetch = () => {
        this.setState({ loading: true });
        this.props.TransferStatusSearch({orderId:this.props.orderId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = []
                data.data = data.data || []
                data.data.map(item => {
                    item.key = item.studentAskId;
                    list.push(item);
                })
                this.setState({
                    data: list,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false, data: [] })
                message.error(data.message);
            }
        })
    }

    //渲染，根据模式不同控制不同输出
    render() { 
        let block_content_1 =
            <ContentBox titleName='转班情况' hideBottomBorder={false}>
                <div className="dv_split"></div>
                <div className="search-result-list">
                    <Table columns={this.columns} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.data}//数据
                        bordered
                        scroll={{x:2000}}
                    /></div>
                <div className="dv_split"></div>
            </ContentBox>

        let block_content = <div>
            {block_content_1}

        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedCounselling = Form.create()(Counselling);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        TransferStatusSearch: bindActionCreators(TransferStatusSearch, dispatch),//根据学生id查询咨询情况
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCounselling);
