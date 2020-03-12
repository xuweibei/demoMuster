/**
 副总退费审批最高限额
 */
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Card, Radio, message, Checkbox, Cascader, InputNumber
} from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item; 

import { searchFormItemLayout } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox'; 
import { MaximumLimitForEdit } from '@/actions/course'; 

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


class CourseStudentRefundHeadquartersManagerView extends React.Component {
    constructor(props) {
        super(props)
        this.state = { 
        };
    }
    componentWillMount() { 
    } 
    onCancel = () => {
        this.props.viewCallback();
    }

    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({ loading: true });
                this.props.MaximumLimitForEdit({maxValue:values.maxValue}).payload.promise.then((response) => {
                    let data = response.payload.data; 
                    if (data.state === 'success') { 
                        this.props.viewCallback()
                    }
                    else {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                })
            }
        });
    }  
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
    render() { 
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;  
        switch (this.props.editMode) {
            case "modify": 
                block_content = (
                    <Form>
                        <Row gutter={24}> 
                            <Col span={8}></Col>
                            <Col span={8}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="最高限额"
                                >
                                    {getFieldDecorator('maxValue', {
                                        initialValue: this.props.maxPrice,
                                        rules: [{
                                            required: true, message: '请输入最高限额!',
                                        }],
                                    })(
                                        <InputNumber min={0} />
                                        )}
                                </FormItem>
                            </Col> 
                            <Col span={8}></Col>
                        </Row>
                    </Form>
                );
                break;
        }


        return (
            <div> 
                <ContentBox titleName={'副总退费审批最高限额修改'} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(CourseStudentRefundHeadquartersManagerView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        MaximumLimitForEdit: bindActionCreators(MaximumLimitForEdit, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
